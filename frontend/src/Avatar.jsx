

const Avatar = ({userId,username,online}) => {
    // colors for different user
    const colors =  ['bg-teal-200', 'bg-red-200',
                  'bg-green-200', 'bg-purple-200',
                  'bg-blue-200', 'bg-yellow-200',
                  'bg-orange-200', 'bg-pink-200', 'bg-fuchsia-200', 'bg-rose-200'];

const userIdColor = parseInt(userId,16);
const colorIndex = userIdColor % colors.length;
const color = colors[colorIndex]

// (string.slice(0,1));

  return (
    <div className={"w-12 h-12 relative rounded-full  flex items-center " +color}>
      <div className="text-center w-full opacity-70">{username}</div>
      {online && (
        <div className="absolute w-3.5 h-3.5 rounded-full bg-green-400 bottom-0 right-1 border border-white"></div>
      )} 

     {!online && (
        <div className="absolute w-3 h-3 bg-blue-500 bottom-0 right-0 rounded-full border border-white"></div>
      )} 

    </div>
  )
}

export default Avatar