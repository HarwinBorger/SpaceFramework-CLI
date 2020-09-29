import chalk from 'chalk';
import fs from 'fs';
import Listr from 'listr';
import ncp from 'ncp';
import path from 'path';
import { install } from 'pkg-install';
import { promisify } from 'util';
import resolve from 'resolve';

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options) {
	return copy(options.templateDirectory, options.targetDirectory, {
		clobber: false,
	});
}

export async function createProject(options) {

	options = {
		...options,
		targetDirectory: options.targetDirectory+'/scss' || process.cwd(),
	};

	var spaceFrameworkTemplates = path.dirname(require.resolve('spaceframework-templates'));
	const templateDir = path.resolve(
		spaceFrameworkTemplates,
		'./templates',
		options.template.toLowerCase()
	);
	options.templateDirectory = templateDir;

	try {
		await access(templateDir, fs.constants.R_OK);
	} catch (err) {
		console.error('%s Invalid template name', chalk.red.bold('ERROR'));
		process.exit(1);
	}

	const tasks = new Listr(
		[
			{
				title: 'Copy project files',
				task: () => copyTemplateFiles(options),
			},
			{
				title: 'Install dependencies',
				task: () =>
					install({
						'spaceframework':'^1.2',
					})
			},
		],
		{
			exitOnError: false,
		}
	);

	await tasks.run();
	console.log('%s Project ready', chalk.green.bold('DONE'));
	return true;
}