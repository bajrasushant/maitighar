describe("Maitighar app", () => {
  beforeEach(function () {
    cy.visit("http://localhost:5173");
    cy.request("POST", "http://localhost:3003/api/testing/reset");
    const user = {
      username: "testing",
      password: "testing",
      repassword: "testing",
      email: "testing@testing.com",
    };
    cy.request("POST", "http://localhost:3003/api/users", user);
  });

  it("front page can be opened", () => {
    cy.visit("http://localhost:5173/");
    cy.contains("Maitighar");
  });

  describe("Login", () => {
    it("succeeds with correct credentials", () => {
      cy.visit("http://localhost:5173");

      cy.get("#username").type("testing");
      cy.get("#password").type("testing");
      cy.get("#login-button").click();

      //TODO: Login not working (add OTP verification process?)
    });

    it("fails with wrong credentials", () => {
      cy.visit("http://localhost:5173");

      cy.get("#username").type("testing");
      cy.get("#password").type("wrong");
      cy.get("#login-button").click();

      cy.contains("Invalid username or password");
    });
  });

  describe("When logged in", () => {
    beforeEach(function () {
      cy.login({ username: "testing", password: "testing" });
      // cy.get("#username").type("testing");
      // cy.get("#password").type("testing");
      // cy.get("#login-button").click();
    });

    it("Issues can be fetched", () => {
      cy.get("#notification").should("contain", "Fetched issues.");
    });
    // it("Issues can be fetched", () => {
    //   cy.wait(5000); // Wait for the issues to load
    //   cy.contains("Test issue").should("be.visible");
    // });

    it("Issue can be created", () => {
      cy.get("#create-button").click();

      // Fill out title and description
      cy.get("#title").type("Test issue");
      cy.get("#description").type("This is a test issue");

      // Select issue type
      cy.get('[type="radio"]').first().check();

      // Select Province (assuming first province)
      cy.get("#province").click();
      cy.get(".MuiMenuItem-root").first().click();

      // Select District (depends on selected province)
      cy.get("#district").click();
      cy.get(".MuiMenuItem-root").first().click();

      // Select Local Government
      cy.get("#localGov").click();
      cy.get(".MuiMenuItem-root").first().click();

      // Select Ward
      cy.get("#ward").click();
      cy.get(".MuiMenuItem-root").first().click();

      // Select Category
      cy.get("#category").click();
      cy.get(".MuiMenuItem-root").first().click();

      // Optional: Image upload (if needed)
      cy.get("#image-upload").selectFile(
        "maitighar-backend/uploads/issues/1721544135868-garbage.jpeg",
        { force: true },
      );

      // Submit the form
      cy.get("#submit").click();

      // Verify issue creation (adjust based on your app's behavior)
      cy.contains("Test issue").should("be.visible");
    });
  });
});
