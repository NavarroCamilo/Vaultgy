# Agentic Coding Process
## Tools Used
For the development of this project, I mainly used two artificial intelligence tools with very well-defined roles. On one hand, I employed ChatGPT exclusively as an organizational and conceptual consulting assistant, to which I explained the requirements, the approach, and the type of application I wanted to achieve so it could guide me on the essential features the system should have. On the other hand, I used Copilot Student for VS Code directly in my development environment for code generation, relying on it both to resolve and write portions of logic that I did not have a clear idea about, and to streamline writing to move faster once I had the general structure of the components clear.

---

## 2. My Approach
The work was structured from a base entirely designed by me, where I first devised the general structure of the project and transmitted it to the AI, explaining the scope and limitations so it could generate an orderly development plan for me. I defined the initial folder and file structure manually, and I even programmed the basic version of the video games module (`game`) on my own so that the assistant would understand with a real example how I wanted to structure each subsequent module. From there, I used the AI to improve that first module, replicate part of its logic in the other components, design tests, and perform debugging to look for potential errors per module, which led me to constantly iterate on prompts when the assistant returned incomplete code fragments or extra lines that did not correspond to what was agreed upon.

---

## 3. Key Prompts
As a first key example, I showed the AI a service with a basic CRUD that used Prisma, explaining the purpose of the module so it could suggest what other functions were missing and implement robust validations. The assistant returned a proposal where it corrected and simplified the logic of the validations; for example, in the `findAll` function of `gameService`, it optimized the optional `take` parameter using the conditional spread operator in a single line instead of the long `if` block I had, and it also structured a `findAllPaged` method that handles pagination in a secure transactional manner with correct page validation. I decided to use this code as is because, after conducting tests with real records created in the database, each of the functions worked perfectly.

```typescript
async findAll(take?: number) {
    return this.prisma.game.findMany({
        ...(take ? { take } : {}),
        orderBy: {
            createdAt: 'desc',
        },
    });
}

async findAllPaged(page = 1, pageSize = 10) {
    if (page < 1) {
        throw new BadRequestException('Page must be >= 1');
    }

    const skip = (page - 1) * pageSize;
    const [games, total] = await this.prisma.$transaction([
        this.prisma.game.findMany({
            skip,
            take: pageSize,
            orderBy: {
                createdAt: 'desc',
            },
        }),
        this.prisma.game.count(),
    ]);

    return {
        data: games,
        meta: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        },
    };
}
```

As a second example, after finishing the main flow of the authentication module (auth), I looked for an alternative to avoid having to manually call a verification function inside each controller method that required session validation. I asked the AI how this could be automated cleanly in the endpoints, and it explained that middlewares and guards existed, recommending guards as the ideal choice in NestJS for this purpose, so I asked it to implement the complete method handling cookies and JWT tokens. I decided to keep the generated guard, but before applying it, I performed a manual cleanup to remove all the old validation logic that was scattered inside my functions; once the controller was clean, I added the guard decorator and verified in the tests that the endpoints correctly restricted access.

```typescript
type AuthUser = {
  id: string;
  username: string;
  email: string;
  role: Role;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private getTokenFromRequest(request: Request) {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      throw new UnauthorizedException('Authentication required');
    }

    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((cookie) => {
        const [key, ...valueParts] = cookie.trim().split('=');
        return [key, decodeURIComponent(valueParts.join('='))];
      }),
    );

    const token = cookies.auth_token;

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    return token;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = this.getTokenFromRequest(request);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new BadRequestException('JWT_SECRET is required');
    }

    let payload: { sub: string };

    try {
      payload = await this.jwtService.verifyAsync<{ sub: string }>(token, {
        secret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    request.user = user;
    return true;
  }
}
```

---

## 4. Critical Evaluation
During the development of the project, the AI demonstrated good general performance by following my concrete instructions and explaining the reasoning behind its changes, but I experienced a clear problem when I was building the library module (library). I expressly asked the assistant to base its work on the logic of the wishlist module (wishlist) that I had implemented first, but the AI began to add unnecessary and repetitive functions inside the services file, completely ignoring that I had previously warned and explicitly clarified to it that those functions were not needed here. This forced me to intervene manually to clean up the file by removing the redundant code, redirect the context of the conversation with new prompts to remind it of the agreed limitations, and correct certain subtle bugs that the AI introduced because it did not correctly assess the scope of the new fragments over the interconnected parts of the system. I performed all of this verification using a local test dataset, manually running queries on each endpoint as soon as a module was completed to check both that successful responses returned the correct structure and that error flows threw the appropriate messages and exceptions when faced with intentional failures.

---

## 5. What I Learned
This assisted development process allowed me to deeply understand advanced components of the NestJS ecosystem that I had not mastered before starting the project. I learned the architectural difference between middlewares and guards, assimilating that the latter are the ideal tool to intercept requests, validate sessions, and protect application routes natively. Likewise, I discovered the existence of multiple additional validations integrated into the framework that allow strengthening the lifecycle of requests to keep the backend secure, ensuring that input data is properly cleaned and validated before interacting with the database.
