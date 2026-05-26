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

  const degreeUrl =
    "https://hkellydemo.catalog.acalog.com/preview_program.php?catoid=64&poid=15711&returnto=4759";

  const admissionsUrl =
    "https://hkellydemo.catalog.acalog.com/preview_program.php?catoid=64&poid=16583&returnto=4759";

  try {

    const degreeHtml = await getUrl(degreeUrl);
    const admissionsHtml = await getUrl(admissionsUrl);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        degree: degreeHtml,
        admissions: admissionsHtml
      })
    };

  } catch (error) {

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message
      })
    };

  }
};
