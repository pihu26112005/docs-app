"use server";

import { revalidatePath } from "next/cache";
import { liveblocks } from "../liveblocks";
import { nanoid } from "nanoid";
import { getAccessType, parseStringify } from "../utils";
import { redirect } from "next/navigation";

// ek random id create kr rha hai 
// us id ke corresponding ek documenta ka room create kr rha hai 
export const createDocument = async ({userId, email}: CreateDocumentParams) => {
    const roomid = nanoid();
    try {
        const metadata = {
            createrId: userId,
            email,
            title: "Untitled Document",
        };
        const usersAccesses: RoomAccesses = { 
            [email]: ["room:write"],
        };
        const room = await liveblocks.createRoom(roomid, {
            // defaultAccesses: ["room:read", "room:presence:write"],
            // groupsAccesses: {
            //   "my-group-id": ["room:write"],
            // },
            // usersAccesses: {
            //   "my-user-id": ["room:write"],
            // },
            metadata,
            usersAccesses,
            defaultAccesses: [],
          });

          revalidatePath('/'); // isse "/" path refresh ho jayega 

          return parseStringify(room); // server se hmesha string format me data aata hai
    }
    catch (error) {
        console.error(error);
    }
}

export const getDocument = async ({ roomId, userId }: { roomId: string; userId: string }) => {
    try {
        const room = await liveblocks.getRoom(roomId);
      
        // const hasAccess = Object.keys(room.usersAccesses).includes(userId);
      
        // if(!hasAccess) {
        //   throw new Error('You do not have access to this document');
        // }
      
        return parseStringify(room);
    } catch (error) {
      console.log(`Error happened while getting a room: ${error}`);
    }
  }

export const updateDocument = async (roomId: string, title: string) => {
    try {
        const room = await liveblocks.updateRoom(roomId, {
            metadata: {
                title,
            },
        });

        revalidatePath('/'); // isse "/" path refresh ho jayega 

        return parseStringify(room);
    } catch (error) {
        console.error(error);
    }
}

export const getAllDocuments = async (email: string ) => {
    try {
        const rooms = await liveblocks.getRooms({ userId: email });
      
        return parseStringify(rooms);
    } catch (error) {
      console.log(`Error happened while getting rooms: ${error}`);
    }
  }

export const updateDocumentAccess = async ({ roomId, email, userType, updatedBy }: ShareDocumentParams) => {
    try {
        const usersAccesses: RoomAccesses = {
        [email]: getAccessType(userType) as AccessType,
        }

        const room = await liveblocks.updateRoom(roomId, { 
        usersAccesses
        })

        if(room) {
        const notificationId = nanoid();

        await liveblocks.triggerInboxNotification({
            userId: email,
            kind: '$documentAccess',
            subjectId: notificationId,
            activityData: {
            userType,
            title: `You have been granted ${userType} access to the document by ${updatedBy.name}`,
            updatedBy: updatedBy.name,
            avatar: updatedBy.avatar,
            email: updatedBy.email
            },
            roomId
        })
        }

        revalidatePath(`/documents/${roomId}`);
        return parseStringify(room);
    } catch (error) {
        console.log(`Error happened while updating a room access: ${error}`);
    }
}

export const removeCollaborator = async ({ roomId, email }: {roomId: string, email: string}) => {
    try {
      const room = await liveblocks.getRoom(roomId)
  
      if(room.metadata.email === email) {
        throw new Error('You cannot remove yourself from the document');
      }
  
      const updatedRoom = await liveblocks.updateRoom(roomId, {
        usersAccesses: {
          [email]: null
        }
      })
  
      revalidatePath(`/documents/${roomId}`);
      return parseStringify(updatedRoom);
    } catch (error) {
      console.log(`Error happened while removing a collaborator: ${error}`);
    }
}
  
export const deleteDocument = async (roomId: string) => {
    try {
        await liveblocks.deleteRoom(roomId);
        revalidatePath('/');
        redirect('/');
    } catch (error) {
        console.log(`Error happened while deleting a room: ${error}`);
    }
}