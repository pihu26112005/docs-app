import { liveblocks } from "@/lib/liveblocks";
import { getUserColor } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { colors } from "@clerk/themes/dist/clerk-js/src/ui/foundations/colors";
import { redirect } from "next/navigation";


export async function POST(request: Request) {

    // Get the current user from your database
    
    const ClerkUser = await currentUser(); // server side --> currentuser , client side --> useUser()

    if(!ClerkUser) redirect('/sign-in');

    const {id, emailAddresses, firstName, lastName, imageUrl} = ClerkUser;
    const user = {
        id,
        metadata: {
            id,
            email: emailAddresses[0].emailAddress,
            name: `${firstName} ${lastName}`,
            avatar: imageUrl,
            color: getUserColor(id),
        },
    };

    // Identify the user and return the result
    const { status, body } = await liveblocks.identifyUser(
        {
        userId: user.metadata.email,
        groupIds: [],
        },
        { userInfo: user.metadata },
    );

    return new Response(body, { status });
}