const objToSqlSetString = (obj) => {
    if(typeof obj === 'string'){
      return `tagName = '${obj}'`;
    }
  if (Array.isArray(obj)){
    return obj.map(item => objToSqlSetString(item));
  }else{
    const key = Object.keys(obj)[0];
    const value = obj[key];
    if (key=="NOT" || key=="not"){
      return `tagName != ${value}`;
    }
    const ans = objToSqlSetString(value).join(` ${key} `);
    console.log(ans);
    return ans;
  }
}

// test
// console.log(objToSqlSetString({OR: [
//     "JS",
//     "HTML",
//     {not: "CSS"}
// ]}));

module.exports = {
  objToSqlSetString
};