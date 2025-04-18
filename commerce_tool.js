import {getToken} from './utilities/oauth.js';
import inquirer from 'inquirer';
import {create_org, check_organisation_id, create_conditions, create_query_pipeline} from './utilities/Create_org.js';

const token = await getToken();

async function run() {
  const {createNewOrg} = await inquirer.prompt([{
    type: 'confirm',
    name: 'createNewOrg',
    message: 'Create new organization?',
    default: false,
  }]);

  let orgId;

  if (createNewOrg) {
    const {orgName, ownerEmail} = await inquirer.prompt([
      {
        type: 'input',
        name: 'orgName',
        message: "Please enter your Coveo's organization name:",
        validate: (input) => input ? true : "Organization name cannot be empty.",
      },
      {
        type: 'input',
        name: 'ownerEmail',
        message: "Please enter your Coveo's owner email:",
        validate: (input) => /\S+@\S+\.\S+/.test(input) || "Enter a valid email.",
      },
    ]);

    const newOrg = await create_org(orgName, ownerEmail, token);
    orgId = newOrg.id;

  } else {
    const org = await check_organisation_id(token);
    if (org && org.id) {
      orgId = org.id;
    } else {
      console.error("No valid organization ID returned.");
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
      message: 'Please enter your tracking ID name:',
      validate: (input) => input ? true : 'Tracking ID name cannot be empty.',
    }
  ]);


  const listConditionsID = await create_conditions(orgId, trackingIdName, token);
  const { pipelineSuffix } = await inquirer.prompt([
    {
      type: 'input',
      name: 'pipelineSuffix',
      message: 'Please enter suffix for the 3 CMH query pipeline: (e.g. cmh-search-[suffix], cmh-recommendations-[suffix])',
    }
  ]);

  await create_query_pipeline(listConditionsID, orgId, pipelineSuffix, token);


}

run();
