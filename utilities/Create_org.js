import {getApiUrl} from "./ApiUrlBuilder.js";

import inquirer from 'inquirer';
import {
  CONDITIONS_ENDPOINT,
  CREATE_ORG_ENDPOINT,
  CREATE_PIPELINES_ENDPOINT,
  SHOW_ORGANIZATION_ENDPOINT
} from "./ApiEndpoints.js";



export async function create_org(orgName, ownerEmail, accessToken) {

  const baseApiUrl = getApiUrl();
  const params = new URLSearchParams({
    name: orgName,
    owner: ownerEmail,
    organizationTemplate: 'POC'
  });

  const url = baseApiUrl + CREATE_ORG_ENDPOINT + `?${params.toString()}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (response.ok) {
    console.log('Successfully created organization');
  } else {
    console.error('Failed to create organization');
    console.error(data);
  }

  return data;
}

export async function create_conditions(orgid, trackingidname, token) {
  const context_list = ['Search', 'Recommendations', 'Listing'];
  const baseApiUrl = getApiUrl();

  const params = new URLSearchParams({
    organizationId: orgid,
  });

  const url = baseApiUrl + CONDITIONS_ENDPOINT + `?${params.toString()}`;
  const condition_lists = [];

  for (const context of context_list) {
    const payload = JSON.stringify({
      description: "",
      definition: `when ( $context [commerce-api] is "${context}" and $context [trackingId] is "${trackingidname}")`
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: payload
    });

    const data = await response.json();

    if (response.ok) {
      condition_lists.push(data.id);
    } else {
      console.error(`Error for ${context}:`, data);
    }
  }
  return condition_lists;
}

export async function check_organisation_id(token) {

  const {orgIdName} = await inquirer.prompt([
    {
      type: 'input',
      name: 'orgIdName',
      message: 'Please enter your Org ID: ',
    }
  ]);

  const baseApiUrl = getApiUrl();
  const url = baseApiUrl + SHOW_ORGANIZATION_ENDPOINT + `${orgIdName}`;
  const headers = {
    'accept': '*/*',
    'Authorization': `Bearer ${token}`
  };

  try {
    const response = await fetch(url, {method: 'GET', headers});

    if (!response.ok) {
      throw new Error(`HTTP error occurred: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully found organization');
    console.log(data);

    return data;
  } catch (err) {
    console.error(err.message);
    console.log("Please check the Token or the Organization ID and try again");
    return check_organisation_id(token);
  }


}

export async function create_query_pipeline(listConditionID, orgId, pipelineSuffix, token) {


  const pipelinesNames = ['cmh-search', 'cmh-recommendations', 'cmh-product-listing']
  const baseApiUrl = getApiUrl();
  const params = new URLSearchParams({
    organizationId: orgId,
  });

  const url = baseApiUrl + CREATE_PIPELINES_ENDPOINT + `?${params.toString()}`;
  for (let i = 0; i < listConditionID.length; i++) {

    const pipeline = pipelinesNames[i]
    const conditionID = listConditionID[i]

    const payload = JSON.stringify({
      name: pipeline + "-" + pipelineSuffix,
      isDefault: false,
      condition: {
        id: conditionID,
      }
    });
    const response = await fetch(url, {
      method: "POST",
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: payload
    });

    if (!response.ok) {
      console.error(`Error creating ${pipeline} pipeline`);
    }
  }
}
