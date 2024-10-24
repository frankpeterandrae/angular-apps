/*
 * Copyright (c) 2024. Frank-Peter Andrä
 * All rights reserved.
 */

const fs = require('fs');
const ts = require('typescript');

const filePath = './apps/homepage/src/app/app.routes.ts';
const fileContent = fs.readFileSync(filePath, 'utf-8');

const sourceFile = ts.createSourceFile('app.routes.ts', fileContent, ts.ScriptTarget.Latest, true);
const routes = [];

function extractRoutes(node) {
	if (ts.isArrayLiteralExpression(node)) {
		node.elements.forEach((element) => {
			if (ts.isObjectLiteralExpression(element)) {
				const pathProperty = element.properties.find((prop) => prop.name && prop.name.text === 'path');
				if (pathProperty && ts.isPropertyAssignment(pathProperty)) {
					const path = pathProperty.initializer.text;
					routes.push(path);
				}
			}
		});
	}
	ts.forEachChild(node, extractRoutes);
}

extractRoutes(sourceFile);

// Generate .htaccess rules
let htaccessContent = `
# Enable the Rewrite Engine
RewriteEngine On

# Set the base URL for all subsequent rules
RewriteBase /

# Redirect all requests for /php-api to the PHP server
# RewriteEngine On
# RewriteCond %{REQUEST_URI} ^/php-api/ [NC]
# RewriteRule ^ - [L]1

# Allow direct access to existing files and directories
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Exclude specific files from being rewritten
RewriteRule ^(robots\\.txt|sitemap\\.xml)$ - [L]

# List of known client-side routes
`;

routes.forEach((route) => {
	if (route !== '**' && !route.startsWith('dev')) {
		htaccessContent += `RewriteRule ^${route}$ /index.html [L]\n`;
	}
});

// Handle unknown routes with 404
htaccessContent += `
# For all other routes, serve index.html with a 404 status
RewriteRule ^ /index.html [R=404,L]

# Custom 404 Error Page
ErrorDocument 404 /index.html
`;

fs.writeFileSync('./libs/shared/config/src/lib/htaccess/.htaccess', htaccessContent);
console.log('.htaccess file has been updated.');
