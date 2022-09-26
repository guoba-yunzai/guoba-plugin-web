import type { VNode } from 'vue';

/**
 * 解析插件作者，支持数组
 * @param record
 */
export function parseAuthorLink(record: Recordable) {
  let { author, authorLink } = record;
  if (!Array.isArray(author)) {
    author = [author];
  }
  if (authorLink && !Array.isArray(authorLink)) {
    authorLink = [authorLink];
  }
  if (authorLink && authorLink.length > 0) {
    let tags: VNode[] = [];
    for (let i = 0; i < author.length; i++) {
      tags.push(
        <a href={authorLink[i]} target="_blank">
          {author[i]}
        </a>,
      );
    }
    return <a-space>{tags}</a-space>;
  }
  return author.join(' ');
}
