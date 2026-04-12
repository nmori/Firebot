/* eslint camelcase: 0 */
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

async function closeReleasedIssues() {
    console.log("Getting latest Firebot release...");
    const { data: release } = await octokit.repos.getLatestRelease({
        owner: "nmori",
        repo: "Firebot"
    });

    console.log(`Latest Firebot release: ${release.tag_name}`);

    console.log("Getting all issues pending release...");
    const issuesToClose = await octokit.paginate(octokit.issues.listForRepo, {
        owner: "nmori",
        repo: "Firebot",
        state: "open",
        labels: "Release Pending"
    });
    console.log(`Found ${issuesToClose.length} issue(s) relased in ${release.tag_name}`);

    for (const issue of issuesToClose) {
        console.log(`Closing issue #${issue.number}...`);

        // Remove the dev labels
        const newLabels = issue.labels.filter(l =>
            l.name !== "Release Pending"
            && l.name !== "Dev Complete"
            && l.name !== "Dev Approved"
        );

        // Add the release version comment
        await octokit.issues.createComment({
            owner: "nmori",
            repo: "Firebot",
            issue_number: issue.number,
            body: `Released in ${release.tag_name}`
        });

        // Close the issue
        await octokit.issues.update({
            owner: "nmori",
            repo: "Firebot",
            issue_number: issue.number,
            labels: newLabels,
            state: "closed"
        });
        console.log(`Issue #${issue.number} closed`);
    }

    return issuesToClose.length;
}

closeReleasedIssues()
    .then((issueCount) => {
        console.log(`Finished. ${issueCount} issues closed.`);
    })
    .catch(console.error);