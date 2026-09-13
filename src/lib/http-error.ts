export function serviceError(scope: string, error: unknown, message = "The service could not complete this request.") {
  console.error(scope, error);
  return Response.json({ error: message }, { status: 502 });
}
