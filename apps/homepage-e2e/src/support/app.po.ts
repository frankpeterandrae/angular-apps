/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

/**
 * Gets the greeting element.
 * @returns {Cypress.Chainable} The greeting element.
 */
export const getGreeting = (): Cypress.Chainable => cy.get('h1');
