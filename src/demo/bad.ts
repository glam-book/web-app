const getSomeDataFromTheServer = async () => {
  const response = await fetch('path/to/some_data');
  const someData = response.json();
  return someData;
};

type ParsedSomeData = {
  a: number;
  b: string;
};

const someDataMapper = (someData: unknown): ParsedSomeData => {
  return {
    a: Number(someData?.payload?.A) ?? 0,
    b: String(someData?.payload?.B) ?? '',
  };
};

const saveSomeData = (someData: ParsedSomeData): void => {
  console.log(someData);
};

const program = async () => {
  try {
    const rawData = await getSomeDataFromTheServer();
    const someData = someDataMapper(rawData);
    saveSomeData(someData);
  } catch (error) {
    console.error(error);
  }
};

program();
