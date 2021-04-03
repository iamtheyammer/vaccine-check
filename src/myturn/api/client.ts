import axios, { AxiosRequestConfig } from "axios";

const clientConfig: AxiosRequestConfig = {
  baseURL: "https://api.myturn.ca.gov/public/",
  headers: {
    cookie:
      process.env.MYTURN_COOKIE ||
      "ak_bmsc=42EF690E07360B45F714888B5FB9129EB81A3596DB34000019F768604D98DC0C~plZnqWoAjZUJGSwKF0DEtq7Kxi5DUeTbFLOwPnCeExlkjs5wuLI45VVjRd+PV+BKfxT/Xyj8ZqbgfdkMqBzcyggk7G+rhO0Ra2Nt2ipSObsDyPiWzZDQIKY14p6nfBZp/0XUfM5ruu2nCis5tHwo9WNV1C/nENOxBI+UUQAEF5nVt87vN3VSBbe6x4IzTNNChf1qFELbKeFVQ/UgjWOmOVPz8OQ/txQXMUs6PAGpfbwaE=; bm_sz=4C8DFB6404B8EA86CFE6E6823BE6F453~YAAQljUauHm1XnR4AQAA0jwFmgu9PeYGJSHCNDeMMjk7XhWGNB2LmIABdXoEsoqgXz1wsebFNBT0GDzAClzxqsGT2TQMZUphjPSy/sdMU8kGbhQJVoNuco3ODSwpG+7BturRYhGRWITGaILRCblQ+W9GnAaqP/A5xh6F2KBokf04oUogaYWTyuwJzPM=; _abck=650290ECE537683F73EBBC03B3606A27~0~YAAQljUauHq1XnR4AQAA0jwFmgWpVtqiOWuPIYty50nuqrcd7Kp5F6n2skf9UZfl6FINSwh6X+nW+rCNx8T6sl+CT4+mKRzgAOTrt/A7ufJLn2zlbLy5f5altLxEUdLQSY02+pcXO992eDcM1K4xSaxRGcG8YSZNz+Fxmqm7/lAkXmaVMVUJiHLinqIrqJI1sVe2Ug9ftaRp7uDPPnYUEhDuErRfsF/NsSM/dGrgvsg8yMDMmEGdxTf8U8WiYS4xQnT1wONo6ZhDKu0u1mzZ/HrzSaPaFXbnl562IG3l3bVlMoAmA5yfZ/VbMwU/zqOwRKNERBidluDN8Enb/PxjT3WbYRhoUBT+DplPNJE2DoeViyZMfzzbFtdymrVTL8knMBbr/gyXJDSz9zbuerzAPqCmSbA=~-1~-1~-1; bm_sv=4E9392C5374D98D59DB1CBB8508AD912~Dm5Rsg2Le4myrO6jr3ymh7HKssIjQlSxRPu3YzCQpGtXql4NpMKj9/Eat0tTKp+etBUZqXi4tO+FoyotpbO79t+rvxJNBRFXjpyHE9prgpIgVhAbOAN0NRl0mfsowp7eXj5I+FwhcwUiAe4dyqpExQ==",
    // "x-correlation-id": "6e6eaf0a-a55e-443b-bb3e-c19c27c5c0fa",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-gpc": "1",
    "sec-ch-ua-mobile": "?0",
    origin: "https://myturn.ca.gov",
    referer: "https://myturn.ca.gov",
    "sec-ch-ua": `"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"`,
  },
};

if (process.env.HTTP_PROXY) {
  const [host, portStr] = process.env.HTTP_PROXY.split(":");
  const port = parseInt(portStr);

  clientConfig.proxy = {
    host,
    port,
  };
}

const client = axios.create(clientConfig);

export default client;
