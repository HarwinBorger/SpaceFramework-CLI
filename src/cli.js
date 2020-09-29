import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main';
import chalk from "chalk/source";

inquirer.registerPrompt('directory', require('inquirer-directory'));

function parseArgumentsIntoOptions(rawArgs) {
	const args = arg(
		{
			'--template': Boolean,
			'--init': Boolean,
			'-t': '--template',
			'-i': '--init',
		},
		{
			argv: rawArgs.slice(2),
		}
	);

	return {
		template: args['--template'] || false,
		init: args['--init'] || false,
	};
}

async function promptForMissingOptions(options) {
	const defaultTemplate = 'ITCSS';
	if (options.skipPrompts) {
		return {
			...options,
			template: options.template || defaultTemplate,
		};
	}

	const questions = [];
	if (!options.template) {
		questions.push({
			type: 'list',
			name: 'template',
			message: 'Which project template do you want?',
			choices: ['ITCSS'], //['ITCSS', 'ITCSS-extended','SMACSS']
			default: defaultTemplate,
		});
	}

	if (!options.targetDirectory) {
		questions.push({
			type: 'directory',
			name: 'targetDirectory',
			message: 'Please choose which folder you want to install the SpaceFramework',
			basePath: '.',
		});
	}

	const answers = await inquirer.prompt(questions);
	return {
		...options,
		template: options.template || answers.template,
		targetDirectory: options.targetDirectory|| answers.targetDirectory,
	};
}


export async function cli(args) {
	let options = parseArgumentsIntoOptions(args);

	if(options.init === true){
		options = await promptForMissingOptions(options);
		await createProject(options);
	}
}
