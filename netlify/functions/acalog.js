exports.handler = async function(event) {
  const apiKey = process.env.ACALOG_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: "Missing ACALOG_API_KEY environment variable."
    };
  }

  const params = event.queryStringParameters || {};
  const endpoint = params.endpoint;

  let apiUrl;

  if (endpoint === "getCatalogs") {
    apiUrl =
      `https://apis.acalog.com/v1/content?format=xml&method=getCatalogs&key=${encodeURIComponent(apiKey)}`;
  }

  else if (endpoint === "searchPages") {
    if (!params.catalog || !params.query) {
      return {
        statusCode: 400,
        body: "Missing catalog or query parameter."
      };
    }

    apiUrl =
      `https://apis.acalog.com/v1/search/pages` +
      `?format=xml` +
      `&method=search` +
      `&key=${encodeURIComponent(apiKey)}` +
      `&catalog=${encodeURIComponent(params.catalog)}` +
      `&query=${encodeURIComponent(params.query)}`;
  }

  else {
    return {
      statusCode: 400,
      body: "Invalid endpoint."
    };
  }

  try {
    const response = await fetch(apiUrl);
    const xml = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=600"
      },
      body: xml
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Catalog API request failed: ${error.message}`
    };
  }
};
