exports.handler = async () => {
  const API_KEY = process.env.ACALOG_API_KEY;

  const admissionsUrl =
    `https://apis.acalog.com/v1/content?format=xml&key=${API_KEY}&catalog=64&method=getItems&type=programs&ids%5B%5D=16583&options%5Bfull%5D=1`;

  const degreeUrl =
    `https://apis.acalog.com/v1/content?format=xml&key=${API_KEY}&catalog=64&method=getItems&type=programs&ids%5B%5D=15711&options%5Bfull%5D=1`;

  try {
    const admissionsRes = await fetch(admissionsUrl);
    const degreeRes = await fetch(degreeUrl);

    const admissionsXml = await admissionsRes.text();
    const degreeXml = await degreeRes.text();

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
      body: JSON.stringify({
        message: error.message
      })
    };
  }
};
