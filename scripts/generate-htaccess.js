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

`;

routes.forEach((route) => {
	if (route !== '**') {
		// Exclude wildcard
		htaccessContent += `RewriteRule ^${route}$ /index.html [L]\n`;
	}
});

// Handle unknown routes with 404
htaccessContent += `
RewriteRule ^ /index.html [R=404,L]

# Custom 404 Error Page
ErrorDocument 404 /index.html
`;

fs.writeFileSync('./libs/shared/config/src/lib/htaccess/.htaccess', htaccessContent);
console.log('.htaccess file has been updated.');
