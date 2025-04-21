# **Angular Apps Project**

## **Introduction**

This project is a **Nx monorepo** containing multiple Angular applications and reusable libraries. It is structured using modern monorepo best practices, supporting component-based architecture, internationalization, and testing. Additionally, it integrates a PHP-based API for backend functionalities.

![GitHub License](https://img.shields.io/github/license/frankpeterandrae/angular-apps)
![GitHub Last Commit](https://img.shields.io/github/last-commit/frankpeterandrae/angular-apps)
![GitHub top language](https://img.shields.io/github/languages/top/frankpeterandrae/angular-apps)
![GitHub language count](https://img.shields.io/github/languages/count/frankpeterandrae/angular-apps)
![GitHub package.json version](https://img.shields.io/github/package-json/v/frankpeterandrae/angular-apps)

[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-highlight.svg)](https://sonarcloud.io/summary/new_code?id=frankpeterandrae_angular-apps)

## **Table of Contents**

- [Introduction](#introduction)
- [Table of Contents](#table-of-contents)
- [Project Structure](#project-structure)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Dependencies](#dependencies)
- [Scripts](#scripts)
- [License](#license)

## **Project Structure**

- **Apps**
  - `demo`: A demo Angular application demonstrating UI components.
  - `homepage`: A production-ready Angular application with translations and extensive assets.
  - `php-api`: PHP backend scripts for managing data operations and authentication.
- **Libraries**
  - `card-generator`: Provides UI components for Kill Team or Warhammer 40K cards.
  - `colour-rack`: A color management library for grid displays and color details.
  - `shared`: Shared libraries for configurations, services, UI themes, and testing utilities.
- **Scripts**
  - Tools for generating files, combining licenses, and automating builds.
- **Assets**
  - Images, SVG icons, and multi-language JSON files.

## **Features**

- **Nx Monorepo** structure for managing multiple applications and libraries.
- Modular architecture with reusable libraries.
- Internationalization with multiple languages (e.g., English, German).
- Component-based architecture for scalable development.
- Automated testing using Jest for unit tests and Cypress for end-to-end tests.
- SCSS-based customizable themes and styling.
- Integrated PHP API for backend data operations.

## **Continuous Integration Test Status**

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=frankpeterandrae_angular-apps&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=frankpeterandrae_angular-apps)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=frankpeterandrae_angular-apps&metric=bugs)](https://sonarcloud.io/summary/new_code?id=frankpeterandrae_angular-apps)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=frankpeterandrae_angular-apps&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=frankpeterandrae_angular-apps)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=frankpeterandrae_angular-apps&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=frankpeterandrae_angular-apps)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=frankpeterandrae_angular-apps&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=frankpeterandrae_angular-apps)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=frankpeterandrae_angular-apps&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=frankpeterandrae_angular-apps)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=frankpeterandrae_angular-apps&metric=coverage)](https://sonarcloud.io/summary/new_code?id=frankpeterandrae_angular-apps)

Continuous Integration Test Status

## **Installation**

1. Clone the repository:
   ```bash
   git clone git@github.com:frankpeterandrae/angular-apps.git
   cd angular-apps
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## **Usage**

- Start a development server for a specific app:
  ```bash
  npx nx run demo:serve
  ```
- Build the project for production:
  ```bash
  npx nx run homepage:build-production
  ```
- Run unit tests for a library or app:
  ```bash
  npx nx run services:test
  ```
- Run end-to-end tests with Cypress:
  ```bash
  npx nx run homepage-e2e:e2e
  ```
- Analyze dependency graph:
  ```bash
  npx nx dep-graph
  ```

## **Configuration**

- Configurations for tools like ESLint, Jest, and Prettier are in the root directory.
- Environment-specific settings can be found in `libs/shared/config/src/lib/config/environments`.
- Testing utilities are under `libs/shared/testing`.

## **Dependencies**

Key dependencies include:

- **Frontend:** Angular, RxJS, Angular CLI.
- **Styling:** SCSS, Prettier.
- **Testing:** Jest, Cypress.
- **Backend:** PHP 7+ for APIs.

Check `package.json` for a complete list of dependencies.

## **Scripts**

The `scripts` directory contains utilities for:

- Combining licenses (`combine-licenses.js`).
- Generating `.htaccess` and `sitemap.xml`.
- Sorting exports (`sort-exports.js`).
- Replacing build dates (`replace-build-date.js`).

## **License**

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).
