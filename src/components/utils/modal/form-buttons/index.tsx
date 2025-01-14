type FormButtonsProps = {
  isValid: boolean;
  handleCancel: () => void;
  submitTitle: string;
};

const FormButtons = ({
  isValid,
  handleCancel,
  submitTitle,
}: FormButtonsProps) => {
  const submitBackground = `${
    isValid
      ? "bg-purple-400 hover:bg-purple-500 ease-in delay-50 transition text-white"
      : "bg-grey-400 cursor-default text-grey-700"
  }`;

  return (
    <div className="flex w-full items-center justify-center">
      <button
        onClick={() => handleCancel()}
        className="delay-50 flex w-full cursor-pointer items-center justify-center rounded-bl-md border-0 bg-grey-200 p-2 text-center text-xl font-bold text-grey-800 transition ease-in hover:bg-grey-300 md:text-2xl"
      >
        CANCEL
      </button>
      <button
        className={`flex w-full items-center justify-center rounded-br-md p-2 text-xl font-bold md:text-2xl ${submitBackground} cursor-pointer border-0`}
        disabled={!isValid}
        type="submit"
      >
        {submitTitle}
      </button>
    </div>
  );
};

export default FormButtons;
