# Wedding invitation website

Simple static wedding invitation site. Deployable to GitHub Pages.

Deployment steps (quick):

1. Create a GitHub repository (public) named `your-username.github.io` or any repo for Pages.
2. From this workspace run:

```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

3. In the repository Settings → Pages, ensure the branch `main` (or `gh-pages`) is selected.
4. The `CNAME` file in this repo sets the custom domain to `navaneethakrishnanwedspandeeswari.invite`.

DNS notes:
- If you set the root/apex domain to `navaneethakrishnanwedspandeeswari.invite`, add A records pointing to GitHub Pages IPs:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

- If you use a subdomain (e.g., `www.example.com`) use a CNAME to `<your-username>.github.io`.

After DNS propagates, enable HTTPS in GitHub Pages settings.
