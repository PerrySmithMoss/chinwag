// import { User, Message, Post, Profile } from "@prisma/client";

// type Object = User | Message | Post | Profile;

// export const removeFieldsFromObject = (object: Object, fields: string[]) => {
//   let newObj = { ...object };

//   Object.keys(newObj).forEach((key) => {
//     if (fields.includes(key)) {
//       delete newObj[key as keyof object];
//     }
//   });

//   return newObj;
// };

import {  Message, Post, Profile } from "@prisma/client";
import { User } from "../types/User";

type Object = User | Message | Post | Profile;

export const removeFieldsFromObject = (object: any, fields: string[]) => {
  let newObj = { ...object };

  Object.keys(newObj).forEach((key) => {
    if (fields.includes(key)) {
      delete newObj[key as keyof object];
    }
  });

  return newObj;
};
