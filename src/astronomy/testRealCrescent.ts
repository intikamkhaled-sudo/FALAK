import { calculateRealCrescent } from "./crescentCalculator";


const result =
calculateRealCrescent({

 latitude:30.0444,

 longitude:31.2357,

 elevation:23,

 date:
 new Date(
  "2026-09-21"
 )

});


console.log(
"===================="
);

console.log(
"REAL CRESCENT TEST"
);

console.log(
"===================="
);


console.log(result);