import { faker } from '@faker-js/faker';

/**
 * Builds a unique Web Tables employee. Unique emails keep rows easy to locate
 * and avoid collisions with the seeded records (Cierra, Alden, Kierra).
 * Values respect the form constraints: names up to 25 chars, age up to 2
 * digits, salary up to 10 digits.
 */
export const buildEmployee = (overrides = {}) => {
  const firstName = faker.person.firstName().slice(0, 25);
  const lastName = faker.person.lastName().slice(0, 25);

  return {
    firstName,
    lastName,
    email: faker.internet
      .email({ firstName, lastName, provider: 'qa.example.com' })
      .toLowerCase()
      .replace(/[^a-z0-9_.@-]/g, ''),
    age: String(faker.number.int({ min: 18, max: 99 })),
    salary: String(faker.number.int({ min: 1000, max: 999999 })),
    department: faker.commerce.department().slice(0, 25),
    ...overrides,
  };
};
