const https = require("https");

function getUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      })
      .on("error", reject);
  });
}

exports.handler = async () => {
  const API_KEY = process.env.ACALOG_API_KEY;

  const admissionsUrl =
    `https://catalog.acalog.com/v1/content?format=xml&key=${API_KEY}&catalog=64&method=getItems&type=programs&ids%5B%5D=16583&options%5Bfull%5D=1`;

  const degreeUrl =
    `https://catalog.acalog.com/v1/content?format=xml&key=${API_KEY}&catalog=64&method=getItems&type=programs&ids%5B%5D=15711&options%5Bfull%5D=1`;

  try {
    const admissionsXml = await getUrl(admissionsUrl);
    const degreeXml = await getUrl(degreeUrl);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        admissions: admissionsXml,
        degree: degreeXml
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: error.message
      })
    };
  }
};
