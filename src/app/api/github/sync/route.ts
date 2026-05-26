import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { syncUserRepos } from '@/lib/github/sync';
import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the userId from the database
    const githubUser = (await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }).then((r) => r.json())) as {
      id: number;
      login: string;
      name: string;
      avatar_url: string;
    };

    // Upsert user
    const [user] = await db
      .insert(users)
      .values({
        githubId: githubUser.id,
        login: githubUser.login,
        name: githubUser.name,
        avatarUrl: githubUser.avatar_url,
        accessToken: session.accessToken,
      })
      .onConflictDoUpdate({
        target: users.githubId,
        set: {
          accessToken: session.accessToken,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to save user' },
        { status: 500 },
      );
    }

    await syncUserRepos(user.id, session.accessToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 },
    );
  }
}
