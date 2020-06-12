// Adapted from https://gist.github.com/mattatz/44f081cac87e2f7c8980
vec3 lab2rgb( vec3 c ) {
    return xyz2rgb( lab2xyz( vec3(100.0 * c.x, 2.0 * 127.0 * (c.y - 0.5), 2.0 * 127.0 * (c.z - 0.5)) ) );
}
