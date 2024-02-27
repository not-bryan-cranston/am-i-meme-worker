import { Octokit } from "octokit"

const octokit = new Octokit({
  auth: process.env.GITHUB_API_KEY,

  // log: {
  //   debug: console.debug,
  //   error: console.error,
  //   info: console.info,
  //   warn: console.warn
  // }
})


async function submitImg(img, mimetype) {

  const owner = 'not-bryan-cranston'
  const repo = 'am-i-meme'

  const master = await octokit.rest.git.getRef({
    owner, repo,
    ref: 'heads/master'
  })

  const id = (new Date()).valueOf()

  const branch = `test${id}`
  await octokit.rest.git.createRef({
    owner, repo,
    ref: `refs/heads/${branch}`,
    sha: master.data.object.sha
  })
  const f = await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: `client/assets/${id}.${mimetype.split('/')[1]}`,
    content: img,
    message: 'msg',
    branch,
    mediaType: { format: 'base64' },
    committer: {
      name: 'am-i-meme',
      email: 'bot@am-i-meme.com'
    }
  })
  await octokit.rest.pulls.create({
    owner,
    repo,
    title: `am-i-a-meme-${Date().valueOf()}`,
    head: branch,
    base: 'master'
  })

}


export default {
	/**
	 * @param {Request} request
	 * @param {Env} env
	 * @param {ExecutionContext} ctx
	 * @returns {Promise<Response>}
	 */
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		console.log(`Hello ${navigator.userAgent} at path ${url.pathname}!`);
		const formData = await request.formData();
        const body = {};
        for (const entry of formData.entries()) {
          body[entry[0]] = entry[1];
        }
		console.log('body',body)
		/** @type {File} */
		// @ts-ignore
		const img  = formData.get("img") 
		console.log('img',img,typeof img,JSON.stringify(img), img.name, img.size)
		await submitImg(img,img.type)
		return new Response(`<html>todo</html>`, {
			headers: {
				"content-type": "text/html",
			},
		});
	},
};
