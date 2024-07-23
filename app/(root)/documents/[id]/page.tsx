
import CollaborativeRoom from "@/components/CollaborativeRoom"
import { getDocument } from "@/lib/actions/rooms.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";

const Document = async ({ params: { id } }: SearchParamProps) => {
  const clerkUser = await currentUser();
  if(!clerkUser) redirect('/sign-in');

  const room = await getDocument({
    roomId: id,
    userId: clerkUser.emailAddresses[0].emailAddress,
  });

  if(!room) redirect('/');

  const userIds = Object.keys(room.usersAccesses); // is room ke users ki id le li
  const users = await getClerkUsers({ userIds }); // clerk se user ki details le li

  const usersData = users.map((user: User) => ({
    ...user,
    userType: room.usersAccesses[user.email]?.includes('room:write')
      ? 'editor'
      : 'viewer'
  })) // user ki details me uska userType add kar diya

  const currentUserType = room?.usersAccesses[clerkUser?.emailAddresses[0]?.emailAddress]?.includes('room:write') ? 'editor' : 'viewer'; 
  // current user ki details me uska userType add kar diya

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom 
        roomId={id}
        roomMetadata={room.metadata}
        users={usersData}
        currentUserType={currentUserType}
      />
    </main>
  )
}

export default Document
