let baseUrl = `${process.env["INFURA_IPFS_ENDPOINT"]}/api/v0/add`;

const generateSVG = (svg: string) => {
  const svgBlob = new Blob([svg], { type: "image/svg+xml" });
  const svgUrl = URL.createObjectURL(svgBlob);
  return svgUrl;
};

export const getSVGFromBlobUrl = async (blobUrl: string) => {
  try {
    const response = await fetch(blobUrl);
    if (response.ok) {
      const svgText = await response.text();
      return svgText;
    } else {
      ("Error getting SVG from blob URL");
    }
  } catch (error) {
    console.error("Error getting the SVG", error);
    return null;
  }
};

export const addImg = async (image: string) => {
  const formData = new FormData();
  const svg = generateSVG(image);

  formData.append("file", svg);

  try {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env["INFURA_IPFS_KEY"] +
              ":" +
              process.env["INFURA_IPFS_SECRET"]
          ).toString("base64"),
      },
      body: formData,
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.log(error);
  }
};

type Metadata = {
  name: FormDataEntryValue | null;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: FormDataEntryValue | null;
  }[];
};

export const addTokenMetadata = async (metadata: Metadata) => {
  const formData = new FormData();
  formData.append("file", JSON.stringify(metadata));
  try {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env["INFURA_IPFS_KEY"] +
              ":" +
              process.env["INFURA_IPFS_SECRET"]
          ).toString("base64"),
      },
      body: formData,
    });
    const json = await res.json();
    return json;
  } catch (error) {
    console.log(error);
  }
};
