const development: boolean = process.env.NODE_ENV === "development";

export default function isDev(): boolean {
  console.log(process.env.NODE_ENV);
  return development;
}
