const Utils = {

    /** Check whether all comments were returned. */
    checkComments(allComments, allCommentId) {
        function traverseComments(comment) {
            if (comment === []) {
                return true;  // return true when there are no comments
            }

            for (let child of comment) {
                const index = allCommentId.indexOf(child.commentId);
                if (index !== -1) {
                    allCommentId.splice(index, 1); // remove the matched commentId from allCommentId
                    if (!traverseComments(child.replies)) {
                        // If any of the child's replies is invalid, return false
                        return false;
                    }
                } else {
                    // If commentId is not in allCommentId, return false
                    return false;
                }
            }
            return true;  // return true if all comments and replies are valid
        }
        const result = traverseComments(allComments);

        // If there are any remaining ids in allCommentId, that means they weren't found in the comments
        // so we return false. Otherwise, we return whatever result we got from traversing the comments.
        return allCommentId.length === 0 && result;
    },

    /** Check whether valid users with access are returned in the accessInfo. */
    checkAccesses(accessInfo, validUsers) {
        if (!accessInfo) {
            return false;
        }

        for (let access of accessInfo) {
            let index = validUsers.indexOf(access.userId);
            if (index !== -1) {
                validUsers.splice(index, 1);
            } else {
                return false;
            }
        }
        return validUsers.length === 0;
    }
}

module.exports = Utils;
