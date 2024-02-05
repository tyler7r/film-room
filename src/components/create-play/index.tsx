// import { Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
// import { useState } from "react";
// import type YouTubePlayer from "react-youtube";
// import { useAuthContext } from "~/contexts/auth";
// import { useIsDarkContext } from "~/pages/_app";

// type CreatePlayProps = {
//   player: YouTubePlayer | null;
//   startClip: () => void;
//   endClip: () => void;
//   resetClip: () => void;
//   gameId: string;
// };

// type PlayType = {
//   timestamp: { start: number | null; end: number | null };
//   note: string;
//   highlight: boolean;
// };

// const CreatePlay = ({
//   player,
//   gameId,
//   startClip,
//   endClip,
//   resetClip,
// }: CreatePlayProps) => {
//   const { user } = useAuthContext();
//   const { backgroundStyle } = useIsDarkContext();
//   const [noteOpen, setNoteOpen] = useState(false);
//   const [isActivePlay, setIsActivePlay] = useState(false);
//   const [playDetails, setPlayDetails] = useState<PlayType>({
//     timestamp: { start: null, end: null },
//     note: "",
//     highlight: false,
//   });
//   const [isValidPlay, setIsValidPlay] = useState(false);

//   const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setPlayDetails({
//       ...playDetails,
//       [name]: value,
//     });
//   };

//   {
//     noteOpen ? (
//       <form
//         onSubmit={handleSubmit}
//         style={backgroundStyle}
//         className="flex w-4/5 flex-col items-center justify-center gap-2 p-4"
//       >
//         <TextField
//           className="w-full"
//           name="note"
//           autoComplete="note"
//           required
//           id="note"
//           label="Note"
//           onChange={handleInput}
//           value={playDetails.note}
//         />
//         <FormControlLabel
//           control={
//             <Checkbox
//               checked={playDetails.highlight}
//               onChange={() =>
//                 setPlayDetails({
//                   ...playDetails,
//                   highlight: !playDetails.highlight,
//                 })
//               }
//               size="small"
//             />
//           }
//           labelPlacement="end"
//           label="Highlight Play?"
//         />
//         <div className="flex items-center justify-center gap-2">
//           <Button type="submit" variant="contained" disabled={!isValidPlay}>
//             Submit
//           </Button>
//           <Button type="button" variant="text" onClick={() => resetPlay()}>
//             Cancel
//           </Button>
//         </div>
//       </form>
//     ) : !isActivePlay ? (
//       <Button onClick={() => startClip()}>Start Clip</Button>
//     ) : (
//       <Button onClick={() => endClip()}>End Clip</Button>
//     );
//   }
// };
