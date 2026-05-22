const GATEWAY_URL = "http://hkellydemo.catalog.acalog.com";
const CATALOG_TYPE = "Undergraduate";

// Change this to the exact title of your custom page in Catalog.
const CUSTOM_PAGE_TITLE = "Academic Policies";

async function callCatalogProxy(params) {
  const queryString = new URLSearchParams(params).toString();

  const response = await fetch(`/.netlify/functions/acalog?${queryString}`);

  if (!response.ok) {
    throw new Error(`API proxy error: ${response.status}`);
  }

  return await response.text();
}

function parseXml(xmlText) {
  return new DOMParser().parseFromString(xmlText, "application/xml");
}

function firstText(parent, tagName) {
  const element = parent.getElementsByTagName(tagName)[0];
  return element ? element.textContent.trim() : "";
}

async function getActiveCatalogIdByType(catalogType) {
  const xmlText = await callCatalogProxy({
    endpoint: "getCatalogs"
  });

  const xml = parseXml(xmlText);

  const catalogs = Array.from(xml.getElementsByTagName("catalog"))
    .filter(catalog => catalog.hasAttribute("id"));

  for (const catalog of catalogs) {
    const id = catalog.getAttribute("id");
    const title = firstText(catalog, "title");
    const type = firstText(catalog, "type");
    const published = firstText(catalog, "published");
    const archived = firstText(catalog, "archived");

    const matchesType =
      type.toLowerCase().includes(catalogType.toLowerCase()) ||
      title.toLowerCase().includes(catalogType.toLowerCase());

    const isPublished = published.toLowerCase() === "yes";
    const isNotArchived = archived.toLowerCase() === "no";

    if (matchesType && isPublished && isNotArchived) {
      return id.replace("acalog-catalog-", "");
    }
  }

  throw new Error(`No active ${catalogType} catalog found.`);
}

async function findPageIdByTitle(catalogId, pageTitle) {
  const xmlText = await callCatalogProxy({
    endpoint: "searchPages",
    catalog: catalogId,
    query: pageTitle
  });

  const xml = parseXml(xmlText);

  const results = Array.from(xml.getElementsByTagName("result"));

  if (results.length === 0) {
    throw new Error(`No page found for "${pageTitle}".`);
  }

  const exactMatch = results.find(result => {
    const name = firstText(result, "name");
    return name.toLowerCase() === pageTitle.toLowerCase();
  });

  const selectedResult = exactMatch || results[0];

  return firstText(selectedResult, "id");
}

async function loadCustomCatalogPageLink() {
  const statusMessage = document.getElementById("statusMessage");
  const customPageLink = document.getElementById("customPageLink");

  try {
    statusMessage.textContent = "Finding active Undergraduate catalog...";

    const catalogId = await getActiveCatalogIdByType(CATALOG_TYPE);

    statusMessage.textContent = `Found active ${CATALOG_TYPE} catalog. Finding custom page...`;

    const pageId = await findPageIdByTitle(catalogId, CUSTOM_PAGE_TITLE);

    const gatewayLink =
      `${GATEWAY_URL}/content.php?catoid=${catalogId}&navoid=${pageId}`;

    customPageLink.href = gatewayLink;
    customPageLink.textContent = `Open ${CUSTOM_PAGE_TITLE}`;

    statusMessage.textContent =
      `Ready. This link uses the active ${CATALOG_TYPE} catalog automatically.`;
  } catch (error) {
    console.error(error);

    statusMessage.textContent =
      "Unable to build the catalog link. Check the page title, API key, and proxy setup.";

    customPageLink.style.display = "none";
  }
}

loadCustomCatalogPageLink();
