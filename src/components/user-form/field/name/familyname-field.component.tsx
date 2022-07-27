import React from 'react';
import { Input } from '../input/input.component';

interface FamilyNameFieldProps {
  name: string;
  className?: string;
  required?: boolean;
}
export const FamilyNameField: React.FC<FamilyNameFieldProps> = ({ name, className, required }) => {

  return (
    <>
       <Input
        id={name}
        name={name}
        labelText={'familyName'}
        light={false}
        hideLabel={true}
      />
    </>
  );
};
