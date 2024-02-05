import { Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { isItemUnique } from "~/utils/helpers";

type MultiInputProps = {
  values: string[] | null;
  handleDelete: (index: number) => void;
  inputType: string;
  currentValue: string;
  handleInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNewItem: (item: string) => void;
};

const MultiInput = ({
  values,
  handleDelete,
  inputType,
  currentValue,
  handleInput,
  handleNewItem,
}: MultiInputProps) => {
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    const isUnique = isItemUnique(currentValue, values);
    if (!currentValue || currentValue === "" || !isUnique) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  }, [currentValue, values]);

  return (
    <div>
      <div>
        {values ? (
          values.map((item, index) => (
            <div key={index}>
              <div>{item}</div>
              <Button
                type="button"
                variant="text"
                onClick={() => handleDelete(index)}
              >
                X
              </Button>
            </div>
          ))
        ) : (
          <div>{`No ${inputType}s...`}</div>
        )}
      </div>
      <div>
        <TextField
          className="w-full"
          name={`current${inputType}`}
          autoComplete={`current${inputType}`}
          required
          id={`current${inputType}`}
          label={inputType}
          onChange={handleInput}
          value={currentValue}
        />
        <Button
          type="button"
          disabled={!isValid}
          onClick={() => {
            handleNewItem(inputType);
            console.log(values);
          }}
        >
          Add Keyword
        </Button>
      </div>
    </div>
  );
};

export default MultiInput;
