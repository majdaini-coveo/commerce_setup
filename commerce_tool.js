import {getToken} from './utilities/oauth.js';
import inquirer from 'inquirer';
import {
  create_org,
  check_organisation_id,
  create_conditions,
  create_query_pipeline,
  create_trackingID
} from './utilities/Create_org.js';
import chalk from 'chalk';
import {setRegion} from "./utilities/ApiUrlBuilder.js";

const token = await getToken()

async function run() {

  const {chooseRegion} = await inquirer.prompt([
    {
      type: 'list',
      name: 'chooseRegion',
      choices: ['EU', 'NA'],
      message: chalk.green.bold('Select a region please'),
    }
  ]);

  console.log("The chosen region is: ", chooseRegion);
  setRegion(chooseRegion);

  const {createNewOrg} = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'createNewOrg',
      message: chalk.green.bold('Create new organization?'),
      default: false,
    }
  ]);

  let orgId;

  if (createNewOrg) {
    const {orgName, ownerEmail} = await inquirer.prompt([
      {
        type: 'input',
        name: 'orgName',
        message: chalk.cyanBright.bold("Please enter your Coveo's organization name:"),
        validate: (input) => input ? true : chalk.redBright.bold("Organization name cannot be empty."),
      },
      {
        type: 'input',
        name: 'ownerEmail',
        message: chalk.cyanBright.bold("Please enter your Coveo's owner email:"),
        validate: (input) => /\S+@\S+\.\S+/.test(input) || chalk.redBright.bold("Enter a valid email."),
      },
    ]);

    const newOrg = await create_org(orgName, ownerEmail, token);
    orgId = newOrg.id;

  } else {
    const org = await check_organisation_id(token);
    if (org && org.id) {
      orgId = org.id;
    } else {
      console.error(chalk.redBright.bold("No valid organization ID returned."));
      return;
    }
  }

  if (!orgId) {
    console.error("Organization ID is not valid. Exiting.");
    return;
  }

  const {trackingIdName} = await inquirer.prompt([
    {
      type: 'input',
      name: 'trackingIdName',
      message: chalk.cyanBright.bold('Please enter your tracking ID name:'),
      validate: (input) => input ? true : chalk.redBright.bold('Tracking ID name cannot be empty.'),
    }
  ]);

  await create_trackingID(orgId, trackingIdName, token)

  const listConditionsID = await create_conditions(orgId, trackingIdName, token);
  const {pipelineSuffix} = await inquirer.prompt([
    {
      type: 'input',
      name: 'pipelineSuffix',
      message: chalk.cyanBright.bold('Please enter suffix for the 3 CMH query pipeline: (e.g. cmh-search-[suffix], cmh-recommendations-[suffix])'),
    }
  ]);

  await create_query_pipeline(listConditionsID, orgId, pipelineSuffix, token);


}

run();
