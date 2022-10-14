/// <reference types="cypress" />
import '@testing-library/cypress/add-commands'
import '@frsource/cypress-plugin-visual-regression-diff';

const CypressMagic = undefined;

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const fieldMap = {
  eta: '.eta',
  title: '.card-title',
  project: '.card-subtitle',
  description: '.card-text',
  time: '.timer',
}
type FieldMap = typeof fieldMap;
type EditableField = keyof FieldMap;
type TimedReportTask = { [key in EditableField]?: string; } & {
  status?: string;
};

Cypress.Commands.add(
  'taskFieldEdit',
  { prevSubject: ['element'] },
  (subject: any, fieldName: EditableField, value: string) => {
    cy.wrap(subject)
      .find(fieldMap[fieldName])
      .dblclick()
      .type(`${value}{enter}`)
      .contains(value)
      .wrap(subject)

    return undefined; // cypress magic
  },
);

Cypress.Commands.add(
  'taskCreate',
  (task: TimedReportTask = {}) => {
    cy.get('[aria-label="Add Task"]').click();

    const { status, ...taskRest } = task

    if (status) {
      cy.get('.task-card')
        .last()
        .rightclick()
        .get('#context-menu')
        .findByText(status)
        .click();
    }

    for (const key in taskRest) {
      const field = key as EditableField;
      const value = task[field] as string;
      cy.get('.task-card')
        .last()
        .taskFieldEdit(field, value);
    }

    cy.get('.task-card').last();
    return CypressMagic;
  },
);

declare global {
  namespace Cypress {
    interface Chainable {
      taskFieldEdit(field: keyof FieldMap, value: string): Chainable<Element>
      taskCreate(task?: TimedReportTask): Chainable<Element>
    }
  }
}

export {};
