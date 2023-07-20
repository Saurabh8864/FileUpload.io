import Avatar from "./Avatar.jsx";

export default function Contact({ id, username, onClick, selected, online }) {
  return (
    <div
      key={id}
      onClick={() => onClick(id)} className={ "border-b-gray-200 py-2 pl-4 flex items-center gap-3 cursor-pointer  " +(selected ? "bg-blue-50" : "") } >
      {selected && <div className="w-1 bg-blue-400 h-12 rounded-r-md">
        </div>} 

      <div className="flex gap-2  py-2 pl-4 rounded-r-md items-center">
        <Avatar online={online} username={username} userId={id} />
         <span className="text-gray-1200"> {username}</span> 
      </div>
    </div>
  );
}
