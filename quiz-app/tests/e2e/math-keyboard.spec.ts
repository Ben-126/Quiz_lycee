import { test, expect } from "@playwright/test";

// Données mock : question à réponse courte pour déclencher le clavier
const MOCK_REPONSE_COURTE = {
  questions: [
    {
      type: "reponse_courte",
      question: "Quelle est la valeur de π arrondie à 2 décimales ?",
      reponseCorrecte: "3.14",
      explication: "π ≈ 3,14",
    },
  ],
};

// Mock question QCM (clavier ne doit PAS apparaître)
const MOCK_QCM = {
  questions: [
    {
      type: "qcm",
      question: "Quel est le résultat de 2+2 ?",
      options: ["3", "4", "5", "6"],
      reponseCorrecte: "4",
      explication: "2+2=4",
    },
  ],
};

test.describe("Clavier mathématique — PC", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("/api/quiz/generate", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_REPONSE_COURTE) })
    );
    await page.route("/api/quiz/verify", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ correcte: true, feedback: "Bravo !" }) })
    );
  });

  test("le bouton clavier apparaît pour une question reponse_courte en maths", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    const boutonClavier = page.locator('button[title="Clavier mathématique"]');
    await expect(boutonClavier).toBeVisible();
  });

  test("le clavier s'ouvre et se ferme au clic du bouton", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');

    // Le clavier est fermé par défaut
    await expect(page.locator('button[role="button"]').filter({ hasText: "OPÉRATIONS" })).not.toBeVisible();

    // Ouvrir le clavier
    await page.click('button[title="Clavier mathématique"]');
    await expect(page.locator('text=OPÉRATIONS')).toBeVisible();
    await expect(page.locator('text=PHYSIQUE-CHIMIE')).toBeVisible();

    // Fermer le clavier
    await page.click('button[title="Clavier mathématique"]');
    await expect(page.locator('text=OPÉRATIONS')).not.toBeVisible();
  });

  test("les 7 onglets sont tous présents", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await page.click('button[title="Clavier mathématique"]');

    const onglets = ["OPÉRATIONS", "INÉQUATIONS", "GÉOMÉTRIE", "ENSEMBLES", "UNITÉS", "SUITES ET FONCTIONS", "PHYSIQUE-CHIMIE"];
    for (const onglet of onglets) {
      await expect(page.locator(`text=${onglet}`)).toBeVisible();
    }
  });

  test("un symbole OPÉRATIONS s'insère dans le champ texte", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await page.click('button[title="Clavier mathématique"]');

    // Cliquer sur le symbole π
    await page.click('button:has-text("π")');

    const input = page.locator('input[name="reponse"]');
    await expect(input).toHaveValue("π");
  });

  test("plusieurs symboles s'accumulent dans l'input", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await page.click('button[title="Clavier mathématique"]');

    await page.click('button:has-text("3")');
    await page.click('button:has-text(",")');
    await page.click('button:has-text("1")');
    await page.click('button:has-text("4")');

    const input = page.locator('input[name="reponse"]');
    await expect(input).toHaveValue("3,14");
  });

  test("l'onglet INÉQUATIONS affiche ≤ ≥ < > ≈", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await page.click('button[title="Clavier mathématique"]');
    await page.click('text=INÉQUATIONS');

    await expect(page.locator('button:has-text("≤")')).toBeVisible();
    await expect(page.locator('button:has-text("≥")')).toBeVisible();
    await expect(page.locator('button:has-text("≈")')).toBeVisible();
  });

  test("l'onglet ENSEMBLES affiche ℕ ℤ ℝ ∈ ∉", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await page.click('button[title="Clavier mathématique"]');
    await page.click('text=ENSEMBLES');

    // Sélecteurs exacts (exact: true) pour éviter les faux positifs entre ℝ et ℝ*, ∈ et ∉
    await expect(page.getByRole("button", { name: "ℕ", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "ℤ", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "ℝ", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "∈", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "∉", exact: true })).toBeVisible();
  });

  test("l'onglet PHYSIQUE-CHIMIE affiche → ρ ⇌ Δ", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await page.click('button[title="Clavier mathématique"]');
    await page.click('text=PHYSIQUE-CHIMIE');

    await expect(page.locator('button:has-text("→")')).toBeVisible();
    await expect(page.locator('button:has-text("ρ")')).toBeVisible();
    await expect(page.locator('button:has-text("⇌")')).toBeVisible();
    await expect(page.locator('button:has-text("Δ")')).toBeVisible();
  });

  test("le clavier apparaît aussi pour physique-chimie", async ({ page }) => {
    await page.goto("/physique-chimie/constitution-et-transformation/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    const boutonClavier = page.locator('button[title="Clavier mathématique"]');
    await expect(boutonClavier).toBeVisible();
  });

  test("le clavier n'apparaît PAS pour une question QCM", async ({ page }) => {
    await page.route("/api/quiz/generate", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_QCM) })
    );
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="options-qcm"]');
    await expect(page.locator('button[title="Clavier mathématique"]')).not.toBeVisible();
  });

  test("le clavier n'apparaît PAS pour le français", async ({ page }) => {
    await page.route("/api/quiz/generate", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_REPONSE_COURTE) })
    );
    await page.goto("/francais/poesie-moyen-age-xviiie/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await expect(page.locator('button[title="Clavier mathématique"]')).not.toBeVisible();
  });

  test("le formulaire se soumet avec un symbole inséré", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await page.click('button[title="Clavier mathématique"]');
    await page.click('button:has-text("3")');
    await page.click('button:has-text(",")');
    await page.click('button:has-text("1")');
    await page.click('button:has-text("4")');
    await page.click('button:has-text("Valider ma réponse")');

    // La correction doit s'afficher
    await expect(page.locator('[data-testid="correction-display"]')).toBeVisible({ timeout: 5000 });
  });

  test("pas de débordement horizontal avec le clavier ouvert", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await page.click('button[title="Clavier mathématique"]');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });
});

test.describe("Clavier mathématique — Tablette (768px)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.route("/api/quiz/generate", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_REPONSE_COURTE) })
    );
    await page.route("/api/quiz/verify", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ correcte: true, feedback: "Bravo !" }) })
    );
  });

  test("le bouton clavier est visible sur tablette", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await expect(page.locator('button[title="Clavier mathématique"]')).toBeVisible();
  });

  test("le clavier s'ouvre sans débordement horizontal sur tablette", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await page.click('button[title="Clavier mathématique"]');
    await expect(page.locator('text=OPÉRATIONS')).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test("les onglets sont scrollables sur tablette", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await page.click('button[title="Clavier mathématique"]');

    // L'onglet le plus à droite doit être accessible
    await page.click('text=PHYSIQUE-CHIMIE');
    await expect(page.locator('button:has-text("→")')).toBeVisible();
  });

  test("un symbole s'insère correctement sur tablette", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await page.click('button[title="Clavier mathématique"]');
    await page.click('button:has-text("π")');
    await expect(page.locator('input[name="reponse"]')).toHaveValue("π");
  });
});

test.describe("Clavier mathématique — Téléphone (375px)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.route("/api/quiz/generate", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_REPONSE_COURTE) })
    );
    await page.route("/api/quiz/verify", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ correcte: true, feedback: "Bravo !" }) })
    );
  });

  test("le bouton clavier est visible sur téléphone", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await expect(page.locator('button[title="Clavier mathématique"]')).toBeVisible();
  });

  test("le clavier s'ouvre sans débordement horizontal sur téléphone", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await page.click('button[title="Clavier mathématique"]');
    await expect(page.locator('text=OPÉRATIONS')).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test("les boutons de symboles sont suffisamment grands sur téléphone", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await page.click('button[title="Clavier mathématique"]');

    // Le premier bouton (0) doit avoir une hauteur suffisante pour le tactile
    const bouton = page.locator('button:has-text("0")').first();
    await expect(bouton).toBeVisible();
    const box = await bouton.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(36); // min 36px pour le tactile
  });

  test("un symbole s'insère correctement sur téléphone", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await page.click('button[title="Clavier mathématique"]');
    await page.click('text=INÉQUATIONS');
    await page.click('button:has-text("≤")');
    await expect(page.locator('input[name="reponse"]')).toHaveValue("≤");
  });

  test("l'onglet SUITES ET FONCTIONS est accessible sur téléphone", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await page.click('button[title="Clavier mathématique"]');

    const onglet = page.locator('text=SUITES ET FONCTIONS');
    await expect(onglet).toBeVisible();
    await onglet.scrollIntoViewIfNeeded();
    await onglet.click();
    await expect(page.locator('button:has-text("α")')).toBeVisible();
  });

  test("le formulaire complet fonctionne sur téléphone", async ({ page }) => {
    await page.goto("/mathematiques/nombres-et-calculs/quiz");
    await page.waitForSelector('[data-testid="form-reponse-courte"]');
    await page.click('button[title="Clavier mathématique"]');
    await page.click('button:has-text("3")');
    await page.click('button:has-text(",")');
    await page.click('button:has-text("1")');
    await page.click('button:has-text("4")');

    const input = page.locator('input[name="reponse"]');
    await expect(input).toHaveValue("3,14");

    await page.click('button:has-text("Valider ma réponse")');
    await expect(page.locator('[data-testid="correction-display"]')).toBeVisible({ timeout: 5000 });
  });
});
