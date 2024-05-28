type EmptyMessageProps = {
  message: string;
};

const EmptyMessage = ({ message }: EmptyMessageProps) => {
  return (
    <div className="p-4 text-center text-2xl font-bold">
      No {message} found!
    </div>
  );
};

export default EmptyMessage;
