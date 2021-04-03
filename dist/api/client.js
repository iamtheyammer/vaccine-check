"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const client = axios_1.default.create({
  baseURL: "https://api.myturn.ca.gov/public/",
  headers: {
    cookie:
      "ak_bmsc=7B485B73670848E7791B2DE1FC8BF757B81CDBAD4D60000053AC67604A7AF736~plTmH88fkkk8+4A1JZIZn+Zv8Bbb6nLVd20MmbaUZThio6XfS+F8K8Gn1Sa3FG829apVIWBjKTHu34aKgj6vsZ7IROAPcEe5tMJbnK6BUEJP4WZfyUAIGpaow3+7AsTSQnaFa+310l4ZP6kEwIC3jZJBRudNrnl2/ywWoFCOWHzuvwzv/Y713EzEF78rxwvX4JpdX078KmGPAjSORzDx1QnLJ990idNpydAgWmtcaBpDo=; bm_sz=8A2094BB6B636F1F3046361A895D4B3D~YAAQrdscuNk6fXN4AQAA1yT5lAuJmn52+AzAanoQRdVT3NU/V1+9pDAajcpfCUB50fTJw7qwPGC9bRDfOP5TDInqHxCHp1qOMQKz9Zkrcxw4ejAuklDTK8jx1rJB34vtMQhXtk7iJTyMrp0LK/M8iJzihFXGTWW82fMJ+HNp6NpvPhzNuo5noFq/Hg==; _abck=0249B97660A8D459E261F05F17D6EFAF~0~YAAQ3OkyF8YRFHh4AQAAyskelQV4qM9SmlQW7VwtUfhq+eR7k5blLgfNadX2CSRBKwJIjwcXxrWtaM/m1Rmjw7wU/RFUMv1OSVScSKT7kCBGPRJLKBwk/+bfDZbTu2P9nbLsp9Uo7FYEb1xNmv386EwtGQHQIBmQ6tXgy411aeAT1OvBc/dFg0Fe+cHyujj3pznd2Ee7LR9h/da613R4PosLqnWIBexjMO/L5Ft52d8eOa2goG077jLOmTD98TtXQ09Zj3UPTecYPOji3VyjNEoqWK/QlM7KCx1uRPPJCYhk3dS2Hf775CarpCDF5p+zd1Q5HJV5fOpF8SxNs5/rT+ustextid9gFYdPPlH8J/UgvckgmyVte0fBCVXcqqUQmuDudhu4zTiXUmfvsWtq1uNFPqY=~-1~-1~-1; bm_sv=F79ACB504E029D018F304B9A269C5C34~I6CRlmYNmX/8ynwwIuzHmyQ5fMHtEYHEhhu6zGFFy4E+tbaoK+Noa7WE5+vG1AhKyRogSyFaC/9uAIdWTklrcg92XsW+CiPZhfkIIGU8Y3VldTfGij72uKn4dQlAWPmcCCFnG4b5X120yMjcSyGwaZrI7cnUW8neBF3TzTdHM2g=",
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
  proxy: {
    host: "localhost",
    port: 8888,
  },
});
exports.default = client;
