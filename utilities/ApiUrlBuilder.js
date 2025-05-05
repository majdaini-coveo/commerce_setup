let currentRegion = null;

export function setRegion(region) {
  currentRegion = region.toLowerCase();
}

export function getApiUrl() {

  if (!currentRegion) {
    throw new Error("Region not set.");
  }

  let OrgRegion = ''
  if (currentRegion.toLocaleLowerCase() === 'eu') {
    OrgRegion = "-" + currentRegion
  }

  return `https://platform${OrgRegion}.cloud.coveo.com/rest`;
}


