<div align="center">
<h1>Chinwag</h1>
<p>A chat application where users can message in real-time.</p>

![tech_stack](https://user-images.githubusercontent.com/59027997/134377330-4dbb7747-e9cb-4f36-8047-738ce6703a27.png)

</div>
<div>
<h2>Features</h2>
<ul>
  <li>Login / Registration / Logout</li>
  <li>Real-time messaging</li>
  <li>JWT Authentication with access/refresh tokens</li>
</ul>
</div>

<div>
<h2>Technologies</h2>
<ul>
  <li>Next.js with React-Query</li>
  <li>Node.js & Express</li>
  <li>JWT</li>
  <li>Prisma ORM</li>
  <li>PostgreSQL</li>
</ul>
</div>

<h2>Video Demo</h2>

[![Watch the video](https://user-images.githubusercontent.com/59027997/184316677-d14e579b-03b2-4234-89e9-1f0b3ae18ef5.png)](https://user-images.githubusercontent.com/59027997/184316414-fec2b62a-0c07-4b56-84ce-e6123942eaf3.mp4)
</div>

<h2>Images</h2>

![Desktop/Mobile App Images](https://user-images.githubusercontent.com/59027997/184316990-61f0458b-ccd2-465e-bc0d-8ec30732f8f8.png)

![Desktop Design](https://user-images.githubusercontent.com/59027997/184318271-5774357a-5839-4b9d-b799-b6ea87c4f0a3.png)

![Mobile Design](https://user-images.githubusercontent.com/59027997/184318225-369cb779-f1bc-4033-a313-fe0302adfdbb.png)

</div>

### Local development

Use Node.js 26.13.0 (see `.node-version`) and Yarn Classic. From the repository root, create the local
configuration once and generate a signing key for the API.

```sh
cp client/.env.example client/.env.local
(umask 077; sed "s/^JWT_SECRET=.*/JWT_SECRET=$(openssl rand -hex 32)/" server/.env.example > server/.env)
docker compose up -d --build
cd client
yarn install --frozen-lockfile
yarn dev
```

Open [Chinwag locally](http://localhost:3000). The API listens on loopback port
5560. Set `POSTGRES_PORT` before starting Compose if host port 5432 is already
in use. Compose applies the committed database migrations at startup.
The example Cloudinary values let the app start locally. For avatar uploads,
replace them with the credentials for your Cloudinary account and set the
matching public values in `client/.env.local`.

Run `yarn lint` and `yarn build` in `client`, and `yarn test` and
`yarn build` in `server`. Run `yarn audit` in both directories.

### VPS API releases

Deploy the matching client and API together when rolling out authenticated
Socket.IO. The client requests a short-lived socket ticket from the API before
connecting.

The API workflow deploys an immutable image through its own restricted SSH
account and the `VPS Production` environment. It cannot apply the Docker stack
from this repository. An administrator owns the existing Swarm service
configuration. See the
[portfolio release runbook](https://github.com/PerrySmithMoss/perry-infra/blob/main/deploy/portfolio/README.md)
for installation, production checks and rollback by digest and revision.
