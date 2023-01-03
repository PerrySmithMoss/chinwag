export const removeFieldsFromObject = (object: any, fields: string[]) => {
  let newObj = { ...object };

  Object.keys(newObj).forEach((key) => {
    if (fields.includes(key)) {
      delete newObj[key as keyof object];
    }
  });

  return newObj;
};
