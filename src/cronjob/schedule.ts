import unleashDragon from "./index";

(async () => {

  
  const result = await unleashDragon();

  console.log(result);
})().catch((err) => {
  console.error(err);
});
