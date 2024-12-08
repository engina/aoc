#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#define MAX_NODES 100
#define MAX_CONNECTIONS 1000

typedef struct Connection Connection;
typedef struct MNode MNode;

struct Connection
{
  MNode *a;
  MNode *b;
  bool cut;
  char key[10];
};

struct MNode
{
  char id[10];
  Connection *conns[MAX_NODES];
  int conn_count;
};

Connection connections[MAX_CONNECTIONS];
int connection_count = 0;

MNode nodes[MAX_NODES];
int node_count = 0;

MNode *get_or_create_node(const char *id)
{
  for (int i = 0; i < node_count; i++)
  {
    if (strcmp(nodes[i].id, id) == 0)
    {
      return &nodes[i];
    }
  }
  MNode *new_node = &nodes[node_count++];
  strcpy(new_node->id, id);
  new_node->conn_count = 0;
  return new_node;
}

Connection *create_connection(const char *aid, const char *bid)
{
  char key[10];
  if (strcmp(aid, bid) < 0)
    sprintf(key, "%s-%s", aid, bid);
  else
    sprintf(key, "%s-%s", bid, aid);

  for (int i = 0; i < connection_count; i++)
  {
    if (strcmp(connections[i].key, key) == 0)
    {
      return &connections[i];
    }
  }

  Connection *new_conn = &connections[connection_count++];
  strcpy(new_conn->key, key);
  new_conn->a = get_or_create_node(aid);
  new_conn->b = get_or_create_node(bid);
  new_conn->cut = false;

  new_conn->a->conns[new_conn->a->conn_count++] = new_conn;
  new_conn->b->conns[new_conn->b->conn_count++] = new_conn;

  return new_conn;
}

int walk(MNode *node, bool *visited)
{
  if (visited[node - nodes])
  {
    return 0;
  }

  visited[node - nodes] = true;
  int sum = 1;

  for (int i = 0; i < node->conn_count; i++)
  {
    Connection *conn = node->conns[i];
    if (conn->cut)
    {
      continue;
    }

    MNode *other = (conn->a == node) ? conn->b : conn->a;
    sum += walk(other, visited);
  }
  return sum;
}

void parse_input(const char *input)
{
  char buffer[1024];
  strcpy(buffer, input);
  char *line = strtok(buffer, "\n");

  while (line != NULL)
  {
    char id[10], nextId[10];
    sscanf(line, "%s", id);

    char *token = strtok(line + strlen(id) + 1, " ");
    while (token != NULL)
    {
      create_connection(id, token);
      token = strtok(NULL, " ");
    }
    line = strtok(NULL, "\n");
  }
}

int main()
{
  const char *input = "jqt rhn xhk nvd\n"
                      "rsh frs pzl lsr\n"
                      "xhk hfx\n"
                      "cmg qnr nvd lhk bvb\n"
                      "rhn xhk bvb hfx\n"
                      "bvb xhk hfx\n"
                      "pzl lsr hfx nvd\n"
                      "qnr nvd\n"
                      "ntq jqt hfx bvb xhk\n"
                      "nvd lhk\n"
                      "lsr lhk\n"
                      "rzs qnr cmg lsr rsh\n"
                      "frs qnr lhk lsr\n";

  parse_input(input);

  int total_nodes = node_count;
  for (int i = 0; i < connection_count; i++)
  {
    connections[i].cut = true;
    bool visited[MAX_NODES] = {false};
    int groupA = walk(&nodes[0], visited);
    int groupB = total_nodes - groupA;

    printf("Cut connection: %s, GroupA: %d, GroupB: %d\n",
           connections[i].key, groupA, groupB);

    connections[i].cut = false;
  }

  return 0;
}
