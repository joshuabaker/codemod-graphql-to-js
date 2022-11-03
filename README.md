# .graphql to .js

Codemod to convert `.graphql` files to `.js` formatted with `graphql-tag`.

Automatically handles fragments imported using `#import`.

### Usage

```
node path/to/script.js path/to/project/src
```

### Before

```graphql
#import "./FragmentEntry.graphql"

fragment article on articles_article_Entry {
  ...entry
  articleType {
    title
    slug
  }
}
```

### After

```js
import gql from "graphql-tag";
import FragmentEntry from "./FragmentEntry";

const FragmentArticle = gql`
  ${FragmentEntry}

  fragment article on articles_article_Entry {
    ...entry
    articleType {
      title
      slug
    }
  }
`;

export default FragmentArticle;
```
