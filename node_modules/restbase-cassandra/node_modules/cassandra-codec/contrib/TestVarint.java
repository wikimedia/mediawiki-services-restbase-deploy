class TestVarint {
    // Hex print helper
    final protected static char[] hexArray = "0123456789ABCDEF".toCharArray();
    public static String bytesToHex(byte[] bytes) {
        char[] hexChars = new char[bytes.length * 2];
        for ( int j = 0; j < bytes.length; j++ ) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = hexArray[v >>> 4];
            hexChars[j * 2 + 1] = hexArray[v & 0x0F];
        }
        return new String(hexChars);
    }

    public static void main(String[] args) {
        if (args.length > 0) {
            System.out.println(
                    bytesToHex(
                        new java.math.BigInteger(args[0]).toByteArray()
                    )
            );
        } else {
            System.out.println("Encode Java BigInteger Varints & print them as hex");
            System.out.println("Usage: java TestVarint <n>");
            System.out.println("  where n is a number");
        }
    }
}
