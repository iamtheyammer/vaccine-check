import axios from "axios";

const client = axios.create({
  baseURL: "https://api.myturn.ca.gov/public/",
  headers: {
    cookie:
      "bm_sz=6DBE3072D48664C217ED370CAAF8210E~YAAQ3OkyFxb5Cnh4AQAAfYJqjguuyNk2k/C9vogqQ15q16Sm2KSe8XK7C81asJdZ67LunPYwiYEd5dSdTKXwrToJQPz9tOqdzGy1mFEiObRA9D0ok6CqwiUr/xRxXr7km0/D3biMfKAFhIQIWW9/umKxboKiysF5p540im7sSB4xqLrgihAruK40W/M=; _abck=FED669FE05B824C280D5C48A7461803B~0~YAAQ3OkyFxf5Cnh4AQAAfYJqjgVQeTvrhkOFFO63uWqXz6XzqX0qiAuLEaxGi8NMO0UEbwMjzu4ghHIFp2ixKoX5u7B/O1z8jvDsYpx38lLNJrDf2cZyTgXBVwZEq5CMzBnGRvw3U+B3xMgHJr0sK2ruD5EV/CPjKok8iD6wAOqNaxuI4SYVks+Ywmr6iX48wDTpM2fl2sL1yxExI9pzE7WHc3W5ZCYb9lo1sOWOFG3mmm5ZqXO/yPc6fm1PNPteTLKQg4wsjdFNJJI23nAxaF2xX4mNmJxPTj2JsZ75K3DLovQXqp2chzPhXDuD62jR/YXjqi3F8T0RvjMUw99pnW5vS1qDft3xmlCtMYH8JDXyqI7bDsiebM3nPys7+WCfnGcayZ6jLRPH6J3NeYTS8IqVvlo=~-1~-1~-1; ak_bmsc=B3C82880BB219E9EFA569E409EC5BBEF1732E9E34D420000972E666064B6807D~plNLZyQrYAT1aLbstxbYeUctyukcNTRpfHfzgVFUOgMhEZkBxzaPTItMbwH4qNSRd98bIKjvzaobuujk4GOqMwfyxL2WZcN3FWpaEuEH9XG0xk0uRsq5KuvkvgY/Y9AwKFwgx8U9Z//6MiiaEbTOZxcKT3bjbzYFcBnnGRCq1sjyo+GBX3zI+dz5IyvfFR3xC0ozP2mSc75K/ZOlJx77LMXPnuixQwL3ZT/LH0h1kqn6w=; bm_sv=9A693741E29A89A685E02674B3519BE7~I6CRlmYNmX/8ynwwIuzHm8U9L9cvMXqOZmkLAM1lJkf9JOQAqGH9ENFUaGxbD3+6SNLgItuOynsqFHyZV2nxnndLB5AXjPCRtP4ERkFxRAPO3wIv4qbIycvShRFNu/Chd1jXMIqE9sfAhgft9ZynTw/0yLO3MnlvegLY3H9SFOw=",
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

export default client;
